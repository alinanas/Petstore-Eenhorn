import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Pet } from '../../types/Pet';
import { PetApiService } from '../../../services/api/petApi.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AddPetDialog } from '../addDialog/addDialog.component';
import { STATUSES } from '../../constants';
import { Subject, map } from 'rxjs';


@Component({
  selector: 'pets-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: 'petsTable.component.html',
  styleUrls: ['petsTable.component.css'],
})

export class PetsTable  implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  displayedColumns: string[] = ['photoUrls', 'name', 'status', 'category', 'action'];
  dataSource = new MatTableDataSource<Pet>([]);
  isLoading = true;
  statuses = STATUSES;
  defaultStatus = this.statuses[0];
  showError = false;
  showSuccess = false;
  showDeleteSuccess = false;
  total = 0;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private apiService: PetApiService,
    private _liveAnnouncer: LiveAnnouncer,
    private dialog: MatDialog) { }
  
  ngOnInit() {
    this.getPetList();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getPetList() {
    this.apiService.get<Pet[]>(`findByStatus?status=${this.defaultStatus}`)
    .pipe(
      map((pets: Pet[]) => {
        this.dataSource = new MatTableDataSource(pets);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isLoading = false;
        this.total = pets.length;
      })
    )
    .subscribe({
      next: pets => console.log(pets),
      error: (error: Error) => console.error('Error fetching pets:', error)
    });
  }

  createNewPet(pet: Pet) {
    const newId = 1001+this.total;

    this.apiService.post('', {
      id: newId,
      name: pet.name,
      category: {
        id: 1,
        name: "Pet"
      },
      photoUrls: [pet.photoUrls],
      tags: [{id: newId, name: pet.name}],
      status: pet.status || "available",
    }).subscribe({
      next: (id) => {
        this.showSuccess = true;
        this.getPetList();
      },
      error: (error: Error) => console.error('Error adding a pet:', error)
    });
  }

  editPet(pet: Pet) {
    this.apiService.put('', {
      id: pet.id,
      name: pet.name,
      category: pet.category,
      photoUrls: pet.photoUrls,
    tags: [{id: pet.id, name: pet.name}],
    status: pet.status || "available",
    }).subscribe({
      next: () => {
        this.showSuccess = true;
        this.getPetList();
      },
      error: (error: Error) => console.error('Error adding a pet:', error)
    });
  }

  handleStatusChange(event: MatSelectChange) {
    this.defaultStatus = event.value;
    this.isLoading = true;
    this.getPetList();
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  checkImage(pathUrls: string[]) {
    return (pathUrls && pathUrls.length && pathUrls[0] && pathUrls[0].length && 
      (pathUrls[0].indexOf('http://') > -1 || pathUrls[0].indexOf('https://') > -1));
  }

  handleRemoveButtonClick(pet: Pet) {
    if (pet.id) {
      this.apiService.delete(pet.id).subscribe({
        next: () => {
          this.showDeleteSuccess = false;
          this.getPetList();
        },
        error: (error: Error) => {
          console.error('Error while deleting a pet:', error);
          this.getPetList();
        }
      });
    }
  }

  openDialog(data?: Pet): void {
    this.showError = false;
    this.showSuccess = false;
    this.showDeleteSuccess = false;

    const dialogRef = this.dialog.open(AddPetDialog, {
      data: data || {},
    });

    dialogRef.afterClosed().subscribe(pet => {
      if (pet !== null) {
        if (!pet?.name?.trim()) {
          this.showError = true;
        } else {
          if (!data) {
            this.createNewPet(pet);
          } else {
            this.editPet(pet);
          }
        }
      }
    });
  }
}
