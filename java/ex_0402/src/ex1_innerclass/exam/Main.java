package ex1_innerclass.exam;

public class Main {
public static void main(String[] args) {
	RemoteControl r = new RemoteControl();
	RemoteControl.Button btn = r.new Button();
	btn.press();
	System.out.println("현재 전원 상태 : " + r.power);
}
	 
}
