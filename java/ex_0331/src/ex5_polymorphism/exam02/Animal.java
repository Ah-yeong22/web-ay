package ex5_polymorphism.exam02;

//추상 클래스를 상속받은 클래스는 추상 메서드를 반드시 오버라이딩해서 내용을 구현해야 한다
abstract class Animal {
	//추상클래스에도 일반적인 필드나 메서드가 들어갈 수 있다.
	int feed;
	
	public void breath() {
		System.out.println("숨쉰다.");
	}
	//추상 메서드
	public abstract void sound(); 
}
