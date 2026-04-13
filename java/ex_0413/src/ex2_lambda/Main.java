package ex2_lambda;

public class Main {
	public static void main(String[] args) {
		//1. 구현클래스를 만들어서 사용하기
		MyFunctionImpl mi = new MyFunctionImpl();
		mi.run();
		
		//2.익명 클래스 만들기
		MyFunction m = new MyFunction() {
			@Override
			public void run() {
				System.out.println("익명 클래스");
				
			}
		};
		m.run();
		
		//3.람다식 사용
		MyFunction m2 = ()-> {System.out.println("람다식");};
		m2.run();
		//람다식을 사용하는 이유
		//1. 코드가 짧아짐
		//익명 클래스보다 코드를 짧게 작성할 수 있다. 
		
		//2. 핵심 로직이 잘보인다. 
		//클래스 선언, 메서드 선언과 같은 껍데기를 줄이고
		//실제로 하고싶은 동작만 보이게 할 수 있다.
		
		//3. 컬렉션 처리에 유용
		//정렬, 필터링, 반복 처리같은 작업에서 자주 사용됨
		
		//4. 함수형 프로그래밍 스타일을 일부 사용할 수 있다. 
		
		//매개변수가 1개인 람다식
		//람다식은 기본적으로 변수에 담을 수 있다. 
		//타입이 인터페이스여야 함
		PrintNumber pn = num-> {System.out.println(num );};
		pn.print(4);
		
		//매개변수가 2개일 때
		//명령이 안줄이고, return과 중괄호는 같이 생략 가능
		Add add = (a,b) -> a +b;
		int result = add.sum(10, 7);
		System.out.println(result);
		
		NumberCheck num = a -> a % 2 == 0;
		System.out.println(num.test(10));
		
		NumberCheck num2 =  a ->  a > 0;
		System.out.println(num2.test(8));
		
		
		
		
		
		
		
		
		
		
	}
}
