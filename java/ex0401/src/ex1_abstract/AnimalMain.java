package ex1_abstract;

public class AnimalMain {

	public static void main(String[] args) {
		//추상클래스의 객체는 직접만들 수 없다.
		//Animal a = new Animal(); 안됨
		
		Tiger t = new Tiger();
		t.name = "호랑이";
		t.sound();
		t.eat();
	}
}
