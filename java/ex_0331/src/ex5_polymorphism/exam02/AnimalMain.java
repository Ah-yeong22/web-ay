package ex5_polymorphism.exam02;

public class AnimalMain {

	public static void main(String[] args) {
		Zoo z = new Zoo();
		//추상클래스는 객체를 직접 생성할 수 없다.
//		Animal a = new Animal();
		z.printSound(new Dog());
		z.printSound(new Cat());
	}
	
	
}
