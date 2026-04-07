package ex3_generic;

public class Main {

	public static void main(String[] args) {
		GenEx<String> v1 = new GenEx<String>();
		
		v1.setValue("java");
		System.out.println(v1.getValue());
		
		GenEx<Integer> v2 = new GenEx<Integer>();
		
		v2.setValue(100);
		System.out.println(v2.getValue());
		
		GenEx<Character> v3 = new GenEx<Character >();
		
		v3.setValue('c');
		System.out.println(v3.getValue());
		
		Sample<String> sample = new Sample<String>();
		sample.addElment("this is Strin", 5);
		System.out.println(sample.getElement(5));
		
		Printer p = new Printer();
		
		p.printValue("안녕하세요");
		p.printValue(100);
		p.printValue(3.14);
		
		
	}
}
