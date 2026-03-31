package ex4_class_casting;

class Parent{
	public void method1() {
		System.out.println("부모 메서드1");
	}
	public void method2() {
		System.out.println("부모 메서드2");
	}
}

class Child extends Parent{
	@Override
	public void method2() {
		
		int x;
		
		System.out.println("자식 메서드2");
	}
	public void method3() {
		System.out.println("자식 메서드3");
	}
}
public class UpCastingExample {
	public static void main(String[] args) {
		Child child = new Child();
		
		Parent parent = child;
		
		parent.method1();
		parent.method2();//부모타입으로 변환해도 오버라이딩된 메서드가 호출
		//parent.method3(); 자식클래스에 선언된 메서드를 호출하는것은 불가능 
		//paren.x;
		//자식 객체를 부모타입으로 변환하면 자식 클래스에 정의한 멤버(필드,메서드) 사용 불가
		
		((Child)parent).method3();
		
		Child c2 = (Child)parent;
//		c2.x = 100;
	}

}
