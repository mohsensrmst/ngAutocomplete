import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from "@angular/core";
import {AutocompleteGroup} from "../classes/AutocompleteGroup";
import {SelectedAutocompleteItem} from "../classes/typing";
import {AutocompleteItem} from "../classes/AutocompleteItem";
import {NgDropdownDirective} from "../dropdown/ng-dropdown.directive";

@Component({
    selector: 'ng-completer',
    template: `
        <div #element class="ng-autocomplete-dropdown">

            <!--GROUP: {{group.key}}-->

            <div class="ng-autocomplete-inputs" (click)="RegisterClick()" [ngClass]="{'completion-off': !group.completion}">
                <span class="ng-autocomplete-placeholder"
                      *ngIf="_DOM.placeholder.length > 0">{{_DOM.placeholder}}</span>
                <input #input type="text" [placeholder]="group.placeholder" name="completer" [(ngModel)]="_completer"
                       (ngModelChange)="OnModelChange($event)"
                       [value]="_completer"
                       autocomplete="off"
                       (click)="OpenDropdown()"
                       (focus)="OpenDropdown()" class="ng-autocomplete-input">
                
                <span [ngClass]="{'open': dropdown._open}" class="ng-autocomplete-dropdown-icon" (click)="DropdownArray()"></span>
            </div>

            <div class="ng-dropdown" ngDropdown [list]="_items" [element]="element" [input]="input" [active]="_DOM.selected" [key]="group.key"
                 [completion]="group.completion"
                 (hover)="OnHoverDropdownItem($event)"
                 (selected)="SelectItem($event)"
                 (closed)="OnInputBlurred()"
            >
                <div class="dropdown-item" *ngFor="let item of _items; let i = index" (click)="SelectItem(item)"
                     [innerHTML]="item.title | highlight:_highlight"
                >
                </div>
            </div>
        </div>`,
    styles: [`
        .ng-autocomplete-inputs {
            position: relative;
        }

        .ng-autocomplete-inputs.completion-off {
            cursor: pointer;
        }
        
        .ng-autocomplete-inputs.completion-off input {
            pointer-events: none;
        }

        .ng-autocomplete-placeholder {
            pointer-events: none;
        }
        
        .ng-autocomplete-dropdown-icon {
            
        }
        
        .ng-autocomplete-dropdown .ng-dropdown {
            display: none;
        }

        .ng-autocomplete-dropdown .ng-dropdown.open {
            display: block;
        }
    `]
})
export class CompleterComponent implements OnInit {
    @ViewChild(NgDropdownDirective) public dropdown: NgDropdownDirective;

    @Output() public cleared: EventEmitter<string> = new EventEmitter<string>();
    @Output() public selected: EventEmitter<SelectedAutocompleteItem> = new EventEmitter<SelectedAutocompleteItem>();
    @Input() public group: AutocompleteGroup = <AutocompleteGroup>{};

    _items: AutocompleteItem[] = [];
    _completer: string = '';
    _highlight: string = '';

    _DOM = {
        placeholder: <string>'',
        selected: <AutocompleteItem>null
    };

    constructor() {
    }

    /**
     *
     */
    ngOnInit() {
        this.SetItems();
    }

    /**
     * Only used when completion is off.
     * @constructor
     */
    RegisterClick() {
        if (!this.group.completion) {
            this.SwitchDropdownState()
        }
    }

    /**
     *
     * @constructor
     */
    DropdownArray() {
        if (this.group.completion) {
            this.SwitchDropdownState()
        }
    }

    /**
     *
     * @constructor
     */
    SwitchDropdownState() {
        if (this.dropdown._open) {
            this.CloseDropdown();
            return;
        }

        /**
         *
         */
        this.OpenDropdown()
    }

    /**
     *
     * @constructor
     */
    CloseDropdown() {
        this.dropdown._open = false;

        /**
         *
         * @type {string}
         */
        this._DOM.placeholder = '';
    }

    /**
     *
     * @constructor
     */
    OpenDropdown() {
        this.dropdown.Open();

        /**
         *
         * @type {string}
         */
        this._DOM.placeholder = '';
    }

    /**
     *
     * @constructor
     */
    SetItems() {
        this._items = this.group.value;
    }

    /**
     *
     * @constructor
     */
    SelectItem(item: AutocompleteItem) {
        this._completer = item.title;
        this._highlight = '';

        /**
         *
         */
        this.dropdown.Close(null, true);
        this._DOM.selected = item;
        this.selected.emit({group: this.group, item: item});
    }

    /**
     *
     * @param value
     * @constructor
     */
    OnModelChange(value: string) {
        this._completer = value;
        this._highlight = value;

        if (value.length === 0) {
            this._DOM.selected = null;
            this.cleared.emit(this.group.key);
        }

        /**
         *
         * @type {AutocompleteItem[]}
         * @private
         */
        this._items = this.group.value.filter((item) => {
            return item.title.toLowerCase().indexOf(value.toLowerCase()) > -1;
        });
    }

    /**
     *
     * @constructor
     */
    OnInputBlurred() {
        if (!this.HasChosenValue()) {
            /**
             * Let component know completer input has been cleared -
             * this function shows the list again, also resets children, if chosen.
             */
            this.OnModelChange('');
        }
    }

    /**
     *
     * @constructor
     */
    OnHoverDropdownItem(item: AutocompleteItem) {
        if (item == null) {
            this._DOM.placeholder = '';
            return;
        }

        this._DOM.placeholder = item.title;
    }

    // =======================================================================//
    // ! Utils                                                                //
    // =======================================================================//

    /**
     *
     * @constructor
     */
    HasChosenValue(): boolean {
        return this.group.value.reduce((result, item) => {
            if (item.title === this._completer) {
                result = true
            }

            return result
        }, false)
    }

    /**
     *
     * @constructor
     */
    ClearValue() {
        this._completer = '';
        this._DOM.selected = null;

        /**
         *
         */
        this.selected.emit({group: this.group, item: null});
    }
}
