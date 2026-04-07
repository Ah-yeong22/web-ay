package ex3_generic.exam;

public class Main {
	public static void main(String[] args) {
		ArrayPrinter<String> a = new ArrayPrinter<String>();
		String[] name = {"김철수", "이영희", "박민수"};
		a.setArr(name);
		
		for(String s : a.getArr()) {
			System.out.println(s);
		}
		
		ArrayPrinter<Integer> a2 = new ArrayPrinter<Integer>();
		Integer[] age = {10,20,30};
		a2.setArr(age);
		
		for(Integer i : a2.getArr()) {
			System.out.println(i);
		}
	}
}
