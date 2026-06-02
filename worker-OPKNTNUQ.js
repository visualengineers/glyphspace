var y=await import("https://cdn.jsdelivr.net/pyodide/v0.28.0/full/pyodide.mjs"),d=(async()=>{let a=await y.loadPyodide({indexURL:"https://cdn.jsdelivr.net/pyodide/v0.28.0/full/"});await a.loadPackage("micropip");let s=a.pyimport("micropip");return await s.install("pandas"),await s.install("scikit-learn"),a})(),l=Promise.resolve();function f(a){let s=l,e;return l=new Promise(r=>e=r),s.then(()=>a().finally(e))}self.onmessage=async a=>{let s=await d;f(async()=>{try{switch(a.data.type){case"process":{let{fileName:e,buffer:r}=a.data;if(s.FS.writeFile(e,new Uint8Array(r)),!s.FS.analyzePath("processor.py").exists){let o=await fetch("assets/processor.py").then(i=>i.text());s.FS.writeFile("processor.py",o)}let t=await s.runPythonAsync(`
            import json, processor
            processor.process_csv_file("${e}")
          `).then(JSON.parse);postMessage({type:"processed",dataset:t});break}case"getJson":{let{file:e}=a.data,r=s.FS.readFile(e,{encoding:"utf8"});postMessage({type:"json",file:e,data:JSON.parse(r)});break}case"unzip":{let{fileName:e,buffer:r}=a.data,t=e.replace(/\.zip$/,""),o=`${t}.zip`;s.FS.writeFile(o,new Uint8Array(r));try{if(await s.runPythonAsync(`
              import zipfile, os, shutil

              def unpack_flat(zip_path):
                  base = "/" + os.path.splitext(os.path.basename(zip_path))[0]
                  if os.path.exists(base):
                      shutil.rmtree(base)
                  os.mkdir(base)

                  with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                      for member in zip_ref.namelist():
                          if member.endswith('/'): continue
                          source = zip_ref.open(member)
                          target_path = os.path.join(base, os.path.basename(member))
                          with open(target_path, 'wb') as target:
                              shutil.copyfileobj(source, target)
                  print("Unpacked to", base)

              unpack_flat("${o}")
            `),!s.FS.analyzePath(`/${t}`).exists)throw new Error(`Unpack failed: folder /${t} not found`);let n=s.FS.readdir(`/${t}`).filter(p=>/\.(png|jpe?g|webp)$/i.test(p));postMessage({type:"unzipped",folder:t,images:n})}catch(i){postMessage({type:"error",message:`Unzip failed: ${i instanceof Error?i.message:String(i)}`})}break}case"getThumb":{let e=a.data.file;try{let r=s.FS.readFile(`/${e}`,{encoding:"binary"});postMessage({type:"thumb",file:e,data:r.buffer},[r.buffer])}catch(r){postMessage({type:"error",message:`Thumbnail error: ${r instanceof Error?r.message:String(r)}`})}break}case"profileData":{let{fileName:e,buffer:r}=a.data;if(s.FS.writeFile(e,new Uint8Array(r)),!s.FS.analyzePath("preprocessing_processor.py").exists){let i=await fetch("assets/preprocessing_processor.py").then(n=>n.text());s.FS.writeFile("preprocessing_processor.py",i)}let t=await s.runPythonAsync(`
            import preprocessing_processor
            preprocessing_processor.profile_data("${e}")
          `),o=JSON.parse(t);o.fileSize=r.byteLength,postMessage({type:"dataProfile",profile:o});break}case"computeHistogram":{let{fileName:e,columnName:r,bins:t=50}=a.data,o=await s.runPythonAsync(`
            import preprocessing_processor
            preprocessing_processor.compute_histogram("${e}", "${r}", ${t})
          `),i=JSON.parse(o);postMessage({type:"histogram",columnName:r,data:i});break}case"detectOutliers":{let{fileName:e,columnName:r,method:t}=a.data,o=await s.runPythonAsync(`
            import preprocessing_processor
            preprocessing_processor.detect_outliers("${e}", "${r}", "${t}")
          `),i=JSON.parse(o);postMessage({type:"outliers",columnName:r,data:i});break}case"detectDuplicates":{let{fileName:e,subsetColumns:r}=a.data,t;if(r&&r.length>0){let n=JSON.stringify(r);t=`
              import preprocessing_processor
              import json
              preprocessing_processor.detect_duplicates("${e}", ${n})
            `}else t=`
              import preprocessing_processor
              preprocessing_processor.detect_duplicates("${e}")
            `;let o=await s.runPythonAsync(t),i=JSON.parse(o);postMessage({type:"duplicates",data:i});break}case"processWithConfig":{let{fileName:e,config:r}=a.data;if(!s.FS.analyzePath("preprocessing_processor_config.py").exists){let p=await fetch("assets/preprocessing_processor_config.py").then(c=>c.text());s.FS.writeFile("preprocessing_processor_config.py",p)}let t=JSON.stringify(r);s.globals.set("sendProgress",(p,c,g)=>{postMessage({type:"processingProgress",step:p,progress:c,message:g})}),await s.runPythonAsync(`
import preprocessing_processor_config

# Create progress callback that calls the JavaScript function
def progress_callback(step, progress, message=''):
    sendProgress(step, progress, message)

preprocessing_processor_config.set_progress_callback(progress_callback)
          `);let o=`${e}.result.json`;await s.runPythonAsync(`
import preprocessing_processor_config
import json

preprocessing_processor_config.process_with_config(
    "${e}",
    '''${t.replace(/'/g,"\\'")}''',
    "${o}"
)
          `);let i=s.FS.readFile(o,{encoding:"utf8"}),n=JSON.parse(i);postMessage({type:"processed",dataset:n});try{s.FS.analyzePath(e).exists&&s.FS.unlink(e),s.FS.analyzePath(o).exists&&s.FS.unlink(o)}catch(p){console.warn("Failed to cleanup files:",p)}break}case"getProcessedFeatures":{try{let e=s.FS.readFile("processed_features.csv",{encoding:"utf8"});postMessage({type:"processedFeatures",data:e})}catch(e){postMessage({type:"error",message:`Failed to read processed features: ${e instanceof Error?e.message:String(e)}`})}break}}}catch(e){postMessage({type:"error",message:e instanceof Error?e.message:String(e)})}})};
