package ex1_List.ArrayList.LinkedList;

import java.util.LinkedList;
import java.util.List;

//장점 : 삽입/ 삭제가 빠름
//단점 : 조회가 느림
public class LinkedListExample {
	public static void main(String[] args) {
		List<Integer> list = new LinkedList<>();
		list.add(10);
		list.add(20);
		list.add(30);
		
		list.add(1,90);
		System.out.println(list);
	}
}
