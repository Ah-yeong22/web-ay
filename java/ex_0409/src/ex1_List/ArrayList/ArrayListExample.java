package ex1_List.ArrayList;

import java.util.ArrayList;
import java.util.List;

public class ArrayListExample {
	public static void main(String[] args) {
		//ArrayList
		//List 인터페이스를 구현한 대표적인 클래스
		//내부구조 : 배열을 기반으로 동작 
		//장점 : 조회 속도가 빠름(index로 접근하기때문)
		//단점 : 중간 삽입/삭제 느리다(데이터의 이동이 발생한다.)
		//삽입,삭제는 많지 않은데 조회가 많을 때 쓰면 좋음 !
		
		//java.util패키지에 들어잇음
		
		//구현클래스의 객체는 해당 인터페이스의 타입변수에 담을 수 있다. 
		List<String> list = new ArrayList<String>();
		
		//리스트에 데이터 추가하기 
		list.add("A");
		list.add("B");
		
		if(list.add("C")) {
			System.out.println("데이터가 정상적으로 추가되었음");
		}else {
			System.out.println("데이터가 추가되지 않았습니다.");
		}
		
		//내가 원하는 위치에 데이터 넣기 
		list.add(1,"데이터");
		
		//데이터 값 바꾸기
		list.set(1, "D");
		//리스트 출력
		System.out.println(list);
		
		//리스트에 들어있는 데이터를 하나만 꺼내기
		String s = list.get(2);
		System.out.println(s);
		
		//연속되지 않은 인덱스에 값을 넣으려고 하면 
		//ArrayIndexOutOfBoundsException 발생
		//list.add(7,"F");
		
		//정수타입을 담을 수 있는 List객체 만들기 
		List<Integer> list2 = new ArrayList<Integer>();
		
		for(int i = 2; i<=20; i+=2) {
			list2.add(i);
		}
		System.out.println(list2);
		list2.add(10);
		list2.add(10);
		list2.add(10);

		//인덱스 삭제 
		int delNum = list2.remove(3);//인덱스 3번에 있는 값 삭제 
		System.out.println(list2);
		System.out.println(delNum);
		
		//데이터를 직접 지우고 싶음
		//숫자타입의 데이터는 객체화 후 삭제 
		list2.remove(Integer.valueOf(10));//값 지정해서 삭제 (10이라는 숫자 삭제)
		System.out.println(list2);
		
		//설정한 모든 값 삭제 (10 모두 삭제)
		list2.removeIf(n -> n ==10);
		System.out.println(list2);
	}
}
