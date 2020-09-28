import { Component, OnInit } from '@angular/core';
import { Category } from './model/category.model';
import { CategoryService } from './service/category.service';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css'],
})
export class CategoryListComponent implements OnInit {
  public categories: Category[] = [];
  public page: number = 1;

  constructor(private categoryService: CategoryService) {}

  async ngOnInit(): Promise<void> {
    this.categories = await this.categoryService.getAll().toPromise();
  }

  public deletarCategory(id: number): void {
    const deletar = confirm('Desejar realmente deletar este item?');

    if (deletar) {
      this.categoryService.delete(id).subscribe(() => {
        this.categories = this.categories.filter((item) => item.id !== id);
      });
    }
  }
}
