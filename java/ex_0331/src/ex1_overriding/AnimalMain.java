package ex1_overriding;

public class AnimalMain {
	public static void main(String[] args) {
		Animal A1 = new Animal();
		A1.sound();
		Dog d = new Dog();
		d.sound();
		Cat c = new Cat();
		c.sound();
	}
}
