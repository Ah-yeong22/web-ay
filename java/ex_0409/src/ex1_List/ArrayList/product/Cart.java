package ex1_List.ArrayList.product;

import java.util.ArrayList;
import java.util.List;

public class Cart {
	private List<Product> list = new ArrayList<Product>();
	
	public void addProduct(String name, int price, int quantity) {
		for(Product p : list) {
			if(p.getName().equals(name)) {
				p.setQuantity(p.getQuantity()+quantity);
				System.out.println("기존 상품 수량 증가 완료");
				return;
			}
		}
		list.add(new Product(name,price,quantity));
		System.out.println("상품 추가 완료");
	}
}
