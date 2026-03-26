package ex3_class;

public class CarMain {
	public static void main(String[] args) {
		//Scanner 변수면 = new Scanner();
		Car c = new Car();
		
		//객체를 통해 필드에 접근하는 방법
		//변수명.필드명;
		c.price = 100000000;
		c.color = "white";
		c.brand = "HYNDAI";
		
		System.out.println("가격 : " + c.price);
		System.out.println("색상 : " + c.color);
		System.out.println("브랜드 :" + c.brand);
		
		Car c2 = new Car();
		c2.price = 9000000;
		c2.color = "black";
		c2.brand = "KIA";
		
		System.out.println("가격 : " + c2.price);
		System.out.println("색상 : " + c2.color);
		System.out.println("브랜드 :" + c2.brand); 
	}
}
