package ex4_innerclass.instanceclass;

public class OrderMain {
	
	public static void main(String[] args) {
		Order o = new Order(123);
		
		Order.Item item = o.new Item("옷", 30000,2);
		o.printOrderInfo(item);
		
		
	}
}
