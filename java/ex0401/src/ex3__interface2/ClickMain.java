package ex3__interface2;

public class ClickMain {

	public static void main(String[] args) {
		Button b = new Button();
		b.setClickLisxtener(new LoginListener());
		b.click();
		b.setClickLisxtener(new LogoutListener());
		b.click();
		
	}
}
