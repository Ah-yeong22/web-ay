package ex1_generic;

import java.util.List;

//와일드카드
//제네릭 타입에서 정확한 타입은 모르겠지만, 어떤 범위 안에 있는 타입이다.라고 표현할 때 사용
//List<String> : 정확히 String을 담을 수 있는 리스트

//와일드카드의 기본문법
//<?> : 타입을 모름, 아무 타입이나 가능
//<? extends T> : T 또는 T의 자식 타입만 가능(상한 제한)
//<? super T> : T 또는 T의 부모 타입만 가능(하한 제한)
public class Wildcard {
	public void printList(List<?> list) {
		for(Object obj : list) {
			System.out.println(obj);
		}
	}
	
	public void printNumbers(List<? extends Number> list) {
		for(Number obj : list) {
			System.out.println(obj);
		}
	}

}
