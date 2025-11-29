import { Component, Input, Output, EventEmitter, ViewChild, inject, signal, computed, effect } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';

import { Budget, BudgetRecord } from '@app/model/finance/planning/budgets';

import { ShareBudgetModalComponent } from '../share-budget-modal/share-budget-modal.component';
import { CreateBudgetModalComponent } from '../create-budget-modal/create-budget-modal.component';
import { ChildBudgetsModalComponent } from '../../modals/child-budgets-modal/child-budgets-modal.component';

@Component({
  selector: 'app-budget-table',
  templateUrl: './budget-table.component.html',
  styleUrls: ['./budget-table.component.scss'],
  standalone: true,
})
export class BudgetTableComponent {
  private _router$$ = inject(Router);
  private _dialog = inject(MatDialog);

  // Convert Observable input to signal-based input
  @Input() budgets: { overview: BudgetRecord[], budgets: any[] } = { overview: [], budgets: [] };
  
  @Input() canPromote = false;
  @Output() doPromote = new EventEmitter<void>();

  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['name', 'status', 'startYear', 'duration', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('sort', { static: true }) sort!: MatSort;

  // Use computed to derive overviewBudgets from the input
  overviewBudgets = computed(() => this.budgets.overview);

  constructor() {
    // Effect to update dataSource when budgets change
    effect(() => {
      this.dataSource.data = this.budgets.budgets || [];
    }, { allowSignalWrites: true });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /** 
   * Checking whether the user has access to a certain feature.
   */
  access(requested: any): boolean {  
    switch (requested) {
      case 'view':
      case 'clone':
        return true; //budget.access.owner || budget.access.view || budget.access.edit;
      case 'edit':
        return true; // (budget.access.owner || budget.access.edit) && budget.status !== BudgetStatus.InUse && budget.status !== BudgetStatus.InUse;
      default:
        return false;
    }
  }

  filterAccountRecords(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  promote() {
    if (this.canPromote) {
      this.doPromote.emit();
    }
  }

  /** Open share screen to configure budget access. */
  openShareBudgetDialog(parent: Budget | false): void {
    this._dialog.open(ShareBudgetModalComponent, {
      panelClass: 'no-pad-dialog',
      width: '600px',
      data: parent !== null ? parent : false
    });
  }

  /** Open clone screen to clone and reconfigure budget. */
  openCloneBudgetDialog(parent: Budget | false): void {
    this._dialog.open(CreateBudgetModalComponent, {
      height: 'fit-content',
      width: '600px',
      data: parent !== null ? parent : false
    });
  }

  openChildBudgetDialog(parent: Budget): void { 
    const children = this.overviewBudgets().find((budget) => budget.budget.id === parent.id)?.children;
    const childBudgets = children?.map((child) => child.budget) || [];
    
    this._dialog.open(ChildBudgetsModalComponent, {
      height: 'fit-content',
      minWidth: '600px',
      data: { parent: parent, budgets: childBudgets }
    });
  }

  goToDetail(budgetId: string, action: string) {
    this._router$$.navigate(['budgets', budgetId, action]).then(() => this._dialog.closeAll());
  }

  deleteBudget(budget: Budget) {
    // Implementation would go here
  }

  translateStatus(status: number): string {
    switch (status) {
      case 1:
        return 'BUDGET.STATUS.ACTIVE';
      case 0:
        return 'BUDGET.STATUS.DESIGN';
      case 9:
        return 'BUDGET.STATUS.NO-USE';
      case -1:
        return 'BUDGET.STATUS.DELETED';
      default:
        return '';
    }
  }
}