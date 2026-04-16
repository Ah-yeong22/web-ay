package exam_0417.ex2;

public class Main {
	public static void main(String[] args) {
		Product p = new Product("노트북",5);
		
		p.printInfo();
		
		p.sell(3);
		
		p.printInfo();
		
		p.sell(10);
		
		p.printInfo();
	}
}
