package ex1_innerclass.hiddenclass;

public class Main {

	public static void main(String[] args) {
		Car c=new Car();
		//익명 자식 객체가 대입된 필드의 사용 
		c.run1();
		//익명 자식 객체가 대입된 로컬변수 사용
		c.run2();
		
		c.run3(new Tire() {
			@Override
			public void roll() {
				System.out.println("익명 자식 Tire 객체3이 굴러갑니다. ");
			}
		});
	}
}
