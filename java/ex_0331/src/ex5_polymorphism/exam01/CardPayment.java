package ex5_polymorphism.exam01;

public class CardPayment extends Payment {
	
	@Override
	public void pay(int amount) {
		System.out.println("카드로 " + amount + "결제");
	}

}
