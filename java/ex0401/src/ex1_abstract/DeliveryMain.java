package ex1_abstract;

public class DeliveryMain {

	public static void main(String[] args) {
		
		Delivery [] d = {new RoketDelivery(),new StroePickup()};
		
		for(Delivery delivery : d) {
			delivery.printlnvoice();
			delivery.ship();
			delivery.complete();
			System.out.println("------------------");
		}
		
	}
}
