package ex1_innerclass.hiddenclass;

public class CalMain {

	public static void main(String[] args) {
		Calculator c = new Calculator() {
			
			@Override
			public void add(int x, int y) {
				System.out.println(x+y);				
			}
		};
		
		c.add(10, 20);
		}
	
}
