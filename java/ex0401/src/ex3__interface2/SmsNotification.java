package ex3__interface2;

public class SmsNotification implements Notification{

	@Override
	public void send(String message) {
		System.out.println("인증번호" + message);
		
	}

}
