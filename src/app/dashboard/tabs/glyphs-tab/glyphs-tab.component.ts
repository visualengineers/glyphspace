import { Component } from '@angular/core';
import { GlyphConfiguration } from '../../../glyph/glyph-configuration';
import { GlyphType } from '../../../shared/enum/glyph-type';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../../../services/config.service';

@Component({
  selector: 'app-glyphs-tab',
  imports: [CommonModule],
  templateUrl: './glyphs-tab.component.html',
  styleUrl: './glyphs-tab.component.scss'
})
export class GlyphsTabComponent {
  config = new GlyphConfiguration();
  GlyphType = GlyphType;

  constructor(private configService: ConfigService) {}

  ngOnInit(): void {
    this.configService.glyphConfigSubject$.subscribe(cfg => {
      this.config = cfg;
    });
  }

  setGlyphType(type: GlyphType) {
    this.config.glyphType = type;
    this.configService.updateConfiguration();
  }

  isOptionEnabled(prop: string): boolean {
    return (this.config as any)[prop] === true;    
  }

  toggleOption(property: string): void {
    (this.config as any)[property] = !(this.config as any)[property];
    this.configService.updateConfiguration(); // emit change
  }
}

