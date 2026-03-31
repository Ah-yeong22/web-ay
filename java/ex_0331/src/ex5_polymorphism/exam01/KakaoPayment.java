package ex5_polymorphism.exam01;

public class KakaoPayment extends Payment{
	
	@Override
	public void pay(int amount) {
		System.out.println("카카오페이 " + amount + "결제");
	}

}
