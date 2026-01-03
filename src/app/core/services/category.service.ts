import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {

  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('Categories')
      .select('id, type, subtype')
      .order('subtype', { ascending: true });

    if (error) throw error;
    console.debug('Got Categories:', data.length);
    return data as Category[];
  }
}