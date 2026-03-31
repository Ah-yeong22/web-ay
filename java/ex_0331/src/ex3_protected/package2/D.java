package ex3_protected.package2;

import ex3_protected.package1.A;

public class D extends A {

	public D() {
		super(); //A클래스의 생성자 호출
	}
	
	public void method1() {
		//상속받은 필드나 메서드를 사용하할 수 있다.
		this.field= "value";
		this.method();
	}
}
