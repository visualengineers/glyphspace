import { Injectable } from "@angular/core";
import { DatasetCollection } from "../shared/interfaces/dataset-collection";
import { BehaviorSubject, Observable, Subject, of } from "rxjs";
import { WorkerReply } from "../shared/interfaces/pyodide-messages";

@Injectable({ providedIn: 'root' })
export class DataProcessorService {
    private worker = new Worker(new URL('../workers/pyodide.worker', import.meta.url), { type: 'module' });

    private thumbCache = new Map<string, ImageBitmap>();
    private thumbSubjects = new Map<string, BehaviorSubject<ImageBitmap | null>>();

    private message$ = new Subject<WorkerReply>();

    constructor() {
        // Route all incoming messages into Subject
        this.worker.onmessage = ({ data }) => {
            this.message$.next(data);
        };

        // Handle thumbnail responses
        this.message$.subscribe(msg => {
            if (msg.type === 'thumb') {
                this.handleThumb(msg.file, msg.data);
            } else if (msg.type === 'error') {
                console.warn('[PyodideWorker]', msg.message);
            }
        });
    }

    async unzip(file: File): Promise<string> {
        const result = await this.sendRequestUntil<WorkerReply & { type: 'unzipped' }>('unzipped', {
            type: 'unzip',
            fileName: file.name,
            buffer: await file.arrayBuffer()
        });
        return result.folder;
    }

    async process(file: File): Promise<DatasetCollection> {
        const result = await this.sendRequestUntil<WorkerReply & { type: 'processed' }>('processed', {
            type: 'process',
            fileName: file.name,
            buffer: await file.arrayBuffer()
        });
        return result.dataset;
    }

    async fetchJson(file: string): Promise<any> {
        const result = await this.sendRequestUntil<WorkerReply & { type: 'json' }>('json', {
            type: 'getJson',
            file
        }, msg => msg.file === file);
        return result.data;
    }

    /**
     * Reactive thumbnail access — use in rendering logic
     */
    requestThumb(file: string): Observable<ImageBitmap | null> {
        if (this.thumbCache.has(file)) {
            return of(this.thumbCache.get(file)!);
        }
        
        if (!this.thumbSubjects.has(file)) {
            const subject = new BehaviorSubject<ImageBitmap | null>(null);
            this.thumbSubjects.set(file, subject);
            this.worker.postMessage({ type: 'getThumb', file });
        }

        return this.thumbSubjects.get(file)!.asObservable();
    }

    /**
     * Handle incoming thumbnail data
     */
    private async handleThumb(file: string, buffer: ArrayBuffer) {
        try {
            const blob = new Blob([new Uint8Array(buffer)], {
                type: this.guessMimeType(file),
            });
            const img = await createImageBitmap(blob);
            this.thumbCache.set(file, img);

            const subject = this.thumbSubjects.get(file);
            if (subject) {
                subject.next(img);
                subject.complete();
            }
        } catch (err) {
            console.error(`Failed to decode thumbnail "${file}":`, err);
        }
    }

    private guessMimeType(file: string): string {
        if (file.endsWith('.png')) return 'image/png';
        if (file.endsWith('.jpg') || file.endsWith('.jpeg')) return 'image/jpeg';
        if (file.endsWith('.webp')) return 'image/webp';
        return 'application/octet-stream';
    }

    /**
     * Utility to wait for a specific message type (optionally filtered)
     */
    private sendRequestUntil<T extends WorkerReply>(
        type: T['type'],
        message: any,
        matchFn: (msg: T) => boolean = () => true
    ): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const sub = this.message$.subscribe((msg) => {
                if (msg.type === 'error') {
                    sub.unsubscribe();
                    reject(msg.message);
                } else if (msg.type === type && matchFn(msg as T)) {
                    sub.unsubscribe();
                    resolve(msg as T);
                }
            });

            this.worker.postMessage(message);
        });
    }
}
