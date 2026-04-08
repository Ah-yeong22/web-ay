package ex1_generic.exam2;

public class Main {
	public static void main(String[] args) {
		PaymentProcessor<Payment> p = 
				new PaymentProcessor<Payment>(new KakaoPay());
		p.process();
		PaymentProcessor<Payment> p2 = new PaymentProcessor<Payment>(new CardPayment());
		p2.process();
	}
	
}
