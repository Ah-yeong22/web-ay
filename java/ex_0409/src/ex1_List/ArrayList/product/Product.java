package ex1_List.ArrayList.product;

public class Product {
	private String name;
	private int price;
	private int quantity;
	
	public Product(String name, int price, int quantity) {
		this.name=name;
		this.price=price;
		this.quantity=quantity;
		
	}
	public int getTotalPrice() {
		return price*quantity;
	}
	public void setQuantity(int quantity) {
		this.quantity = quantity;
	}
	public String getName() {
		return name;
	}
	public int getPrice() {
		return price;
	}
	public int getQuantity() {
		return quantity;
	}
	@Override
	public String toString() {
		return ("상품명 : "+name+"가격 : " +price+"x"+quantity+"개");
	}
	
}
