import { Component } from "@angular/core";
import {
   DomSanitizer,
   SafeHtml
} from "@angular/platform-browser";

@Component({
   selector: 'hb-icon-defs',
   template: `<div [innerHtml]="safeSvg"></div>`
})
export class HumbugIconDefs {
   public safeSvg: SafeHtml;
   private svgDefs: string = `
      <svg aria-hidden="true" style="position: absolute; width: 0; height: 0; overflow: hidden;" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
         <defs>
            <symbol id="icon-event_seat" viewBox="0 0 24 24">
               <title>event_seat</title>
               <path d="M17.016 12.984h-10.031v-7.969c0-1.078 0.938-2.016 2.016-2.016h6c1.078 0 2.016 0.938 2.016 2.016v7.969zM2.016 9.984h3v3h-3v-3zM18.984 9.984h3v3h-3v-3zM3.984 21v-6h16.031v6h-3v-3h-10.031v3h-3z"/>
            </symbol>
            <symbol id="icon-event_note" viewBox="0 0 24 24">
               <title>event_note</title>
               <path d="M14.016 14.016v1.969h-7.031v-1.969h7.031zM18.984 18.984v-10.969h-13.969v10.969h13.969zM18.984 3c1.078 0 2.016 0.938 2.016 2.016v13.969c0 1.078-0.938 2.016-2.016 2.016h-13.969c-1.125 0-2.016-0.938-2.016-2.016v-13.969c0-1.078 0.891-2.016 2.016-2.016h0.984v-2.016h2.016v2.016h7.969v-2.016h2.016v2.016h0.984zM17.016 9.984v2.016h-10.031v-2.016h10.031z"/>
            </symbol>
            <symbol id="icon-event_busy" viewBox="0 0 24 24">
               <title>event_busy</title>
               <path d="M18.984 18.984v-10.969h-13.969v10.969h13.969zM18.984 3c1.078 0 2.016 0.938 2.016 2.016v13.969c0 1.078-0.938 2.016-2.016 2.016h-13.969c-1.125 0-2.016-0.938-2.016-2.016v-13.969c0-1.078 0.891-2.016 2.016-2.016h0.984v-2.016h2.016v2.016h7.969v-2.016h2.016v2.016h0.984zM9.328 17.016l-1.078-1.078 2.438-2.438-2.438-2.438 1.078-1.078 2.438 2.438 2.438-2.438 1.031 1.078-2.438 2.438 2.438 2.438-1.031 1.078-2.438-2.438z"/>
            </symbol>

            <symbol id="icon-timeline-event-info-circle" viewBox="0 0 36 36">
               <path class="clr-i-solid clr-i-solid-path-1" d="M18,6A12,12,0,1,0,30,18,12,12,0,0,0,18,6Zm-2,5.15a2,2,0,1,1,2,2A2,2,0,0,1,15.9,11.15ZM23,24a1,1,0,0,1-1,1H15a1,1,0,1,1,0-2h2V17H16a1,1,0,0,1,0-2h4v8h2A1,1,0,0,1,23,24Z"></path>
            </symbol>
            <symbol id="icon-timeline-event-block" viewBox="0 0 36 36">
               <path class="clr-i-solid clr-i-solid-path-1" d="M31.42,9.09l-13-6a1,1,0,0,0-.84,0l-13,6A1,1,0,0,0,4,10V27a1,1,0,0,0,.58.91l13,6a1,1,0,0,0,.84,0l13-6A1,1,0,0,0,32,27V10A1,1,0,0,0,31.42,9.09ZM18,14.9,7.39,10,18,5.1,28.61,10ZM30,26.36,19,31.44V16.64l11-5.08Z"></path>
            </symbol>
            <symbol id="icon-timeline-event-blocks-group" viewBox="0 0 36 36">
               <path class="clr-i-solid clr-i-solid-path-1" d="M33.53,18.76,26.6,15.57V6.43A1,1,0,0,0,26,5.53l-7.5-3.45a1,1,0,0,0-.84,0l-7.5,3.45a1,1,0,0,0-.58.91v9.14L2.68,18.76a1,1,0,0,0-.58.91v9.78h0a1,1,0,0,0,.58.91l7.5,3.45a1,1,0,0,0,.84,0l7.08-3.26,7.08,3.26a1,1,0,0,0,.84,0l7.5-3.45a1,1,0,0,0,.58-.91h0V19.67A1,1,0,0,0,33.53,18.76ZM25.61,22,20.5,19.67l5.11-2.35,5.11,2.35Zm-1-6.44-6.44,3V10.87a1,1,0,0,0,.35-.08L24.6,8v7.58ZM18.1,4.08l5.11,2.35L18.1,8.78,13,6.43ZM10.6,17.31l5.11,2.35L10.6,22,5.49,19.67Zm6.5,11.49-6.5,3h0V24.11h0A1,1,0,0,0,11,24l6.08-2.8Zm15,0-6.46,3V24.11A1,1,0,0,0,26,24l6.08-2.8Z"></path>
            </symbol>
            <symbol id="icon-timeline-event-minus-circle" viewBox="0 0 36 36">
               <path d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm6,17.5H12a1.5,1.5,0,0,1,0-3H24a1.5,1.5,0,0,1,0,3Z" class="clr-i-solid clr-i-solid-path-1"></path>
            </symbol>
            <symbol id="icon-timeline-event-circle-arrow" viewBox="0 0 36 36">
               <path d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm8,15.57a1.43,1.43,0,0,1-2,0L19.4,13V27.14a1.4,1.4,0,0,1-2.8,0v-14l-4.43,4.43a1.4,1.4,0,0,1-2-2L18.08,7.7,26,15.59A1.4,1.4,0,0,1,26,17.57Z" class="clr-i-solid clr-i-solid-path-1"></path>
            </symbol>
            <symbol id="icon-timeline-event-connect" viewBox="0 0 36 36">
               <path d="M17,12H14.15a6.25,6.25,0,0,0-6.21,5H2v2H7.93a6.22,6.22,0,0,0,6.22,5H17Z" class="clr-i-solid clr-i-solid-path-1"></path>
               <path d="M28.23,17A6.25,6.25,0,0,0,22,12H19V24h3a6.22,6.22,0,0,0,6.22-5H34V17Z" class="clr-i-solid clr-i-solid-path-2"></path>
            </symbol>
            <symbol id="icon-timeline-event-disconnect" viewBox="0 0 36 36">
               <path d="M12,6a6.21,6.21,0,0,0-6.21,5H2v2H5.83A6.23,6.23,0,0,0,12,18H17V6Z" class="clr-i-solid clr-i-solid-path-1"></path>
               <path d="M33.79,23H30.14a6.25,6.25,0,0,0-6.21-5H19v2H14a1,1,0,0,0-1,1,1,1,0,0,0,1,1h5v4H14a1,1,0,0,0-1,1,1,1,0,0,0,1,1h5v2h4.94a6.23,6.23,0,0,0,6.22-5h3.64Z" class="clr-i-solid clr-i-solid-path-2"></path>
            </symbol>
            <symbol id="icon-timeline-event-scroll" viewBox="0 0 36 36">
               <path d="M34,11.12V6.58a4.5,4.5,0,0,0-4.5-4.5h-16A4.5,4.5,0,0,0,9,6.58V24H2v5.5A4.5,4.5,0,0,0,6.5,34H25.58a4.5,4.5,0,0,0,4.5-4.5V13.13h-2V29.54a2.5,2.5,0,0,1-2.5,2.5H10.24a4.47,4.47,0,0,0,.76-2.5v-23a2.5,2.5,0,0,1,5,0v4.54Z" class="clr-i-solid clr-i-solid-path-1"></path>
            </symbol>
            <symbol id="icon-timeline-event-new" viewBox="0 0 36 36">
               <path class="clr-i-solid clr-i-solid-path-1" d="M34.11,24.49l-3.92-6.62,3.88-6.35A1,1,0,0,0,33.22,10H2a2,2,0,0,0-2,2V24a2,2,0,0,0,2,2H33.25A1,1,0,0,0,34.11,24.49Zm-23.6-3.31H9.39L6.13,16.84v4.35H5V15H6.13l3.27,4.35V15h1.12ZM16.84,16H13.31v1.49h3.2v1h-3.2v1.61h3.53v1H12.18V15h4.65Zm8.29,5.16H24l-1.55-4.59L20.9,21.18H19.78l-2-6.18H19l1.32,4.43L21.84,15h1.22l1.46,4.43L25.85,15h1.23Z"></path>
            </symbol>
            <symbol id="icon-timeline-event-trash" viewBox="0 0 36 36">
               <path class="clr-i-solid clr-i-solid-path-1" d="M6,9V31a2.93,2.93,0,0,0,2.86,3H27.09A2.93,2.93,0,0,0,30,31V9Zm9,20H13V14h2Zm8,0H21V14h2Z"></path>
               <path class="clr-i-solid clr-i-solid-path-2" d="M30.73,5H23V4A2,2,0,0,0,21,2h-6.2A2,2,0,0,0,13,4V5H5A1,1,0,1,0,5,7H30.73a1,1,0,0,0,0-2Z"></path>
            </symbol>
            <symbol id="icon-timeline-event-hourglass" viewBox="0 0 36 36">
               <path d="M29,32H26V24.91a6.67,6.67,0,0,0-2.69-5.33l-1.28-1A6.36,6.36,0,0,0,21,18h0a6.29,6.29,0,0,0,1-.62l1.28-1A6.67,6.67,0,0,0,26,11.09V4h3a1,1,0,0,0,0-2H7A1,1,0,0,0,7,4h3v7.09a6.67,6.67,0,0,0,2.69,5.33l1.28,1A6.36,6.36,0,0,0,15,18h0a6.27,6.27,0,0,0-1,.62l-1.28,1A6.67,6.67,0,0,0,10,24.91V32H7a1,1,0,0,0,0,2H29a1,1,0,0,0,0-2ZM12,24.91a4.66,4.66,0,0,1,1.88-3.72l1.28-1a4.66,4.66,0,0,1,1.18-.63,1,1,0,0,0,.65-.94V17.33a1,1,0,0,0-.65-.94,4.67,4.67,0,0,1-1.19-.63l-1.28-1A4.66,4.66,0,0,1,12,11.09V4H24v7.09a4.66,4.66,0,0,1-1.88,3.72l-1.28,1h0a4.66,4.66,0,0,1-1.18.63,1,1,0,0,0-.65.94v1.34a1,1,0,0,0,.65.94,4.67,4.67,0,0,1,1.19.63l1.28,1A4.66,4.66,0,0,1,24,24.91V32H12Z" class="clr-i-outline clr-i-outline-path-1"></path>
            </symbol>
            <symbol id="icon-timeline-event-bolt" viewBox="0 0 36 36">
               <path d="M10.52,34h-3a1,1,0,0,1-.88-1.44L12.55,21H6a1,1,0,0,1-.85-1.54l10.68-17A1,1,0,0,1,16.64,2H30.07a1,1,0,0,1,.77,1.69L21.78,14h5.38a1,1,0,0,1,.73,1.66l-16.63,18A1,1,0,0,1,10.52,34ZM9.18,32h.91L24.86,16H19.59a1,1,0,0,1-.77-1.69L27.88,4H17.19L7.77,19H14.2a1,1,0,0,1,.88,1.44Z" class="clr-i-outline clr-i-outline-path-1"></path>
            </symbol>
            <symbol id="icon-timeline-event-two-way-arrows" viewBox="0 0 36 36">
               <path d="M23.43,16.83A1,1,0,0,0,22,18.24L25.72,22H7.83a1,1,0,0,0,0,2H25.72L22,27.7a1,1,0,1,0,1.42,1.41L29.53,23Z" class="clr-i-outline clr-i-outline-path-1"></path>
               <path d="M13.24,18.45a1,1,0,0,0,.71-1.71L10.24,13H28.12a1,1,0,0,0,0-2H10.24l3.71-3.73a1,1,0,0,0-1.42-1.41L6.42,12l6.11,6.14A1,1,0,0,0,13.24,18.45Z" class="clr-i-outline clr-i-outline-path-2"></path>
            </symbol>
            <symbol id="icon-circle" viewBox="0 0 36 36">
               <path d="M18,4A14,14,0,1,0,32,18,14,14,0,0,0,18,4Z" class="clr-i-solid clr-i-solid-path-1"></path>
            </symbol>
         </defs>
      </svg>
   `;

   constructor(private domSanitizer: DomSanitizer) {
      this.safeSvg = this.domSanitizer.bypassSecurityTrustHtml(this.svgDefs);
   }
}