package ex1_stream;

import java.util.ArrayList;
import java.util.List;

public class Main {
	public static void main(String[] args) {
		ArrayList<Member> list = new ArrayList<>();
		
		list.add(new Member(1,"홍길동","ACTIVE"));
		list.add(new Member(2,"김철수","INACTIVE"));
		list.add(new Member(3,"이영희","ACTIVE"));
		list.add(new Member(4,"박민수","INACTIVE"));
		list.add(new Member(5,"최지은","ACTIVE"));
		
		list.stream().filter(x -> x.getStatus().equals("ACTIVE")).forEach(System.out::println);
	}
}
