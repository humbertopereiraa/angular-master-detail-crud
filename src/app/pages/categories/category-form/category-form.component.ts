import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Category } from '../model/category.model';
import { CategoryService } from '../service/category.service';
import toastr from 'toastr';

enum ACTION {
  new = 0,
  edit = 1,
}

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css'],
})
export class CategoryFormComponent implements OnInit {
  public currentAction: 0 | 1;
  public categoryForm: FormGroup;
  public pageTitle: string;
  public serverErrorMessages: string[] = null;
  public submittingForm: boolean = false;
  public category: Category = new Category();

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildCategoryForm();
    this.loadCategory();
  }

  ngAfterContentChecked(): void {
    this.setPageTitle();
  }

  public submitForm(): void {
    this.submittingForm = true;

    if (this.currentAction == ACTION.new) {
      this.createCategory();
    } else {
      this.updateCategory();
    }
  }

  private createCategory(): void {
    const category: Category = {
      ...new Category(),
      ...this.categoryForm.value,
    };
    this.categoryService.post(category).subscribe({
      next: (category: Category) => {
        this.actionForSuccess(category);
      },
      error: (erro) => {
        this.actionForError(erro);
      },
    });
  }

  private updateCategory(): void {
    const category: Category = {
      ...new Category(),
      ...this.categoryForm.value,
    };

    this.categoryService.put(category).subscribe({
      next: (category: Category) => {
        this.actionForSuccess(category);
      },
      error: (erro) => {
        this.actionForError(erro);
      },
    });
  }

  private actionForSuccess(category: Category): void {
    toastr.success('Solicitação processada com sucesso!');

    this.router
      .navigateByUrl('categories', { skipLocationChange: true })
      .then(() => this.router.navigate(['categories', category.id, 'edit']));
  }

  private actionForError(error: any): void {
    toastr.error('Ocorreu um erro ao processar a sua solicitação!');

    this.submittingForm = false;

    if (error.status === 422)
      this.serverErrorMessages = JSON.parse(error._body).errors;
    else
      this.serverErrorMessages = [
        'Falha na comunicação com o servidor. Por favor, tente mais tarde.',
      ];
  }

  private setCurrentAction(): void {
    if (this.route.snapshot.url[0].path === 'new')
      this.currentAction = ACTION.new;
    else this.currentAction = ACTION.edit;
  }

  private buildCategoryForm(): void {
    this.categoryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(3)]],
      description: [null],
    });
  }

  private loadCategory(): void {
    if (this.currentAction == ACTION.edit) {
      this.route.paramMap
        .pipe(
          switchMap((params) => this.categoryService.getById(+params.get('id')))
        )
        .subscribe({
          next: (category) => {
            this.category = category;
            this.categoryForm.patchValue(category); // binds load category data to CategoryForm
          },

          error: () => alert('Ocorreu um erro no servidor, tente mais tarde!'),
        });
    }
  }

  private setPageTitle(): void {
    if (this.currentAction == ACTION.new) {
      this.pageTitle = 'Cadastro de Nova Categoria';
    } else {
      const categotyName = this.category.name || '';
      this.pageTitle = 'Editando Categoria: ' + categotyName;
    }
  }
}
