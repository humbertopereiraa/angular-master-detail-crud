export interface Category {
  id?: number;
  name?: string;
  description?: string;
}

export class Category {
  constructor() {
    (this.id = null), (this.name = null), (this.description = null);
  }
}
