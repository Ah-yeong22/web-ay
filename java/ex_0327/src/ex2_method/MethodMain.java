package ex2_method;

public class MethodMain {
	public static void main(String[] args) {
		MethodExample m = new MethodExample();
		m.printInfo();
		
		int result = m.add(10,7);
		System.out.println(result);
		
		double result2 = m.circleArea(10);
		System.out.println(result2);
		
		m.circleRound(5); //return이 없을때
		
		int [] arr = {1,2,3,4};
		m.countEven(arr);
		System.out.println(m.countEven(arr));
		
		//return이 있을때
		int result3 = m.countChar("apple", 'a');
		System.out.println(result3);
		
		
		}
}
