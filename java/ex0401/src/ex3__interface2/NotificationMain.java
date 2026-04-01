package ex3__interface2;

public class NotificationMain {
	public static void main(String[] args) {
		Notification[] notiy = {
				new SmsNotification(),
				new EmailNotification()
		};
		
		for(Notification n : notiy) {
			n.send("안녕하세요");
		}
		
	}
}
