import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';

import { cloneDeep as ___cloneDeep, flatMap as __flatMap } from 'lodash';
import { combineLatest, map } from 'rxjs';

import { Logger } from '@iote/bricks-angular';

import { Budget, BudgetRecord, BudgetStatus, OrgBudgetsOverview } from '@app/model/finance/planning/budgets';

import { BudgetsStore, OrgBudgetsStore } from '@app/state/finance/budgetting/budgets';

import { CreateBudgetModalComponent } from '../../components/create-budget-modal/create-budget-modal.component';

@Component({
  selector: 'app-select-budget',
  templateUrl: './select-budget.component.html',
  styleUrls: ['./select-budget.component.scss', 
              '../../components/budget-view-styles.scss'],
})
/** List of all active budgets on the system. */
export class SelectBudgetPageComponent implements OnInit {
  private _orgBudgets$$ = inject(OrgBudgetsStore);
  private _budgets$$ = inject(BudgetsStore);
  private _dialog = inject(MatDialog);
  private _logger = inject(Logger);

  /** Overview which contains all budgets of an organisation */
  overview = toSignal(this._orgBudgets$$.get(), { initialValue: null });
  sharedBudgets = toSignal(this._budgets$$.get(), { initialValue: [] });

  showFilter = signal(false);

  // Convert the combined observable to a computed signal
  allBudgets = computed(() => {
    const overviewVal = this.overview();
    const budgetsVal = this.sharedBudgets();
    
    if (!overviewVal || !budgetsVal) {
      return { overview: [], budgets: [] };
    }

    const combined = { 
      overview: __flatMap(overviewVal), 
      budgets: __flatMap(budgetsVal) 
    };
    
    // Transform budgets to add endYear property
    const transformedBudgets = combined.budgets.map((budget: any) => ({
      ...budget,
      endYear: budget.startYear + budget.duration - 1
    }));

    return { 
      overview: combined.overview, 
      budgets: transformedBudgets 
    };
  });

  constructor() {
    // Use effect for side effects like logging
    effect(() => {
      const budgets = this.allBudgets().budgets;
      if (budgets?.length) {
        this._logger.log(() => `Budgets loaded: ${budgets.length}`);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    // No need for manual subscriptions since signals handle this automatically
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    
  }

  fieldsFilter(value: (Invoice) => boolean) {    
  }

  toogleFilter(value: boolean) {
    this.showFilter.set(value);
  }

  openDialog(parent: Budget | false): void {
    const dialog = this._dialog.open(CreateBudgetModalComponent, {
      height: 'fit-content',
      width: '600px',
      data: parent !== null ? parent : false
    });

    dialog.afterClosed().subscribe(() => {
      // Dialog after action
    });
  }

  /** 
   * Returns true if the budget can be activated */
  canPromote(record: BudgetRecord): boolean {
    // Get's set on Budget Read from user privileges and budget status.
    return (record.budget as any).canBeActivated;
  }

  /** Activate budget -> Promote to be used in  */
  setActive(record: BudgetRecord) {
    const toSave = ___cloneDeep(record.budget);

    // Clean up budget record values.
    delete (toSave as any).canBeActivated;
    delete (toSave as any).access;

    // Set Active
    toSave.status = BudgetStatus.InUse;

    (record as any).updating = true;
    
    this._budgets$$.update(toSave).subscribe(() => {
      (record as any).updating = false;
      this._logger.log(() => `Updated Budget with id ${toSave.id}. Set as an active budget for this org.`) 
    });
  }
}