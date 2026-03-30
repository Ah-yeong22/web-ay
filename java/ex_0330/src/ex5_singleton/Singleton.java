package ex5_singleton;

public class Singleton {
	//클래스 내부에서 객체 생성
	private static Singleton Singleton = new Singleton();
	
	//private 접근 제한을 갖는 생성자를 선언
	private Singleton() {
	}
		public static Singleton getInstance() {
			return Singleton;
	}
}
