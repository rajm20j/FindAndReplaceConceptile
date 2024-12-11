import { CommonModule } from '@angular/common';
import { ElementRef, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  @ViewChild('editableContent') editableContent!: ElementRef;
  originalText$ = new BehaviorSubject<string>('');
  originalText: string = '';
  findText: string = '';
  replaceText: string = '';
  matchCount: number = 0;
  useRegex: boolean = false;
  caseInsensitiveFlag: string = 'i';
  regexError: string = '';

  ngOnInit(): void {
    this.originalText$.subscribe((value) => this.originalText = value);
  }

  findAndHighlight() {
    if (!this.findText) {
      this.resetHighlight();
      return;
    }

    const regex: RegExp = this.generateRegex(this.findText, `g${this.caseInsensitiveFlag}`);

    const matches = this.originalText.match(regex) || [];
    this.matchCount = matches.length;

    const highlightedContent = this.originalText.replace(regex, match =>
      `<mark class="highlight">${match}</mark>`
    );

    if (this.editableContent) {
      this.editableContent.nativeElement.innerHTML = highlightedContent;
    }
  }

  updateOriginalText() {
    if (this.editableContent) {
      this.originalText$.next(this.editableContent?.nativeElement?.textContent ?? '');
    }
  }

  resetHighlight() {
    if (this.editableContent) {
      this.editableContent.nativeElement.textContent = this.originalText;
      this.matchCount = 0;
    }
  }

  replace(flags: string = '') {
    if (!this.findText) return;

    this.originalText = this.editableContent.nativeElement.textContent || '';

    const regex: RegExp = this.generateRegex(this.findText, flags);

    const replacedText = this.originalText.replace(regex, this.replaceText);

    this.originalText = replacedText;
    this.updateEditableContent(replacedText);
    this.findAndHighlight();
  }

  private updateEditableContent(text: string) {
    if (this.editableContent) {
      this.editableContent.nativeElement.textContent = text;
    }
  }

  toggleUseRegex(): void {
    this.useRegex = !this.useRegex;
    this.findAndHighlight();
  }

  toggleIsCaseInSensitive(): void {
    this.caseInsensitiveFlag = this.caseInsensitiveFlag === 'i' ? '' : 'i';
    this.findAndHighlight();
  }

  private generateRegex(pattern: string, flags: string = ''): RegExp | null {
    let regex: RegExp;
    try {
      if (this.useRegex) {
        regex = new RegExp(pattern, flags);
      } else {
        regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      }
    } catch (error) {
      this.regexError = `Invalid Regex Pattern: ${error}`;
      const errorTimeout = setTimeout(() => {
        this.regexError = '';
        clearTimeout(errorTimeout);
      }, 2 * 1000);
      this.matchCount = 0;
    }
    return regex;
  }
}
