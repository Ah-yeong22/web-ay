package ex5_polymorphism.exam01;

public class Order {

	Payment payment;
	
	public void proccessPayment(int amount) {
		payment.pay(amount);
	}
}
