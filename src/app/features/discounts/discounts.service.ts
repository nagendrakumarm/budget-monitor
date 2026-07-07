@Injectable({ providedIn: 'root' })
export class AccountDiscountsService {
  private key = 'accountDiscounts';

  getDiscounts(): AccountDiscount[] {
    const data = localStorage.getItem(this.key);
    const list: AccountDiscount[] = data ? JSON.parse(data) : [];

    const today = new Date().toISOString().split('T')[0];
    list.forEach(d => {
      if (d.expiryDate < today) d.isActive = false;
    });

    this.save(list);
    return list;
  }

  addDiscount(discount: AccountDiscount) {
    const list = this.getDiscounts();
    list.push(discount);
    this.save(list);
  }

  save(list: AccountDiscount[]) {
    localStorage.setItem(this.key, JSON.stringify(list));
  }

filter() {
  const text = this.searchText.toLowerCase();

  this.filtered = this.discounts.filter(d =>
    d.isActive &&
    (
      d.accountName.toLowerCase().includes(text) ||
      d.merchant.toLowerCase().includes(text) ||
      d.description.toLowerCase().includes(text)
    )
  );
}

isExpiringSoon(date: string): boolean {
  const diff = (new Date(date).getTime() - Date.now()) / (1000 * 3600 * 24);
  return diff <= 7;
}  

}
