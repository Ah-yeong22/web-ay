package ex5_polymorphism.exam01;

public class PaymentMain {

	public static void main(String[] args) {
		Order o = new Order();
		Payment p = new Payment();
		p.pay(30000);

		o.payment = new CardPayment();
		o.proccessPayment(50000);
		o.payment = new KakaoPayment();
		o.proccessPayment(50000);
		
	}
}
