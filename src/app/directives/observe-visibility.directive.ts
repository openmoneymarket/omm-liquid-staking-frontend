import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import { fromIntersectionObserver, IntersectionStatus } from "./from-intersection-observer";

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: "[intersectionObserver]",
  standalone: true,
})
export class IntersectionObserverDirective implements OnInit, OnDestroy {
  @Input() intersectionDebounce = 0;
  @Input() intersectionRootMargin = "0px";
  @Input() intersectionRoot?: HTMLElement;
  @Input() intersectionThreshold?: number | number[];

  @Output() visibilityChange = new EventEmitter<IntersectionStatus>();

  private destroy$ = new Subject<void>();

  constructor(private element: ElementRef) {}
  ngOnInit() {
    const element = this.element.nativeElement;

    const config = {
      root: this.intersectionRoot,
      rootMargin: this.intersectionRootMargin,
      threshold: this.intersectionThreshold,
    };
    fromIntersectionObserver(element, config, this.intersectionDebounce)
      .pipe(takeUntil(this.destroy$))
      .subscribe((status) => {
        this.visibilityChange.emit(status);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
  }
}
