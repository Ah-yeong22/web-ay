package ex1_List.ArrayList;

import java.util.ArrayList;
import java.util.List;

public class ArrayListExample2 {
	public static void main(String[] args) {
		List<Member> members = new ArrayList<>();
		
		Member m1 = new Member();
		m1.setName("홍길동"); 
		m1.setAge(30);
		
		members.add(m1);
		members.add(new Member());
		
		System.out.println(members.get(0).getName());
		System.out.println(members.get(0).getAge());
		
		members.get(1).setName("박민수");
		members.get(1).setAge(39);
		
		System.out.println(members.get(1).getName());
		System.out.println(members.get(1).getAge());
		
		members.add(m1);
		members.add(new Member());
		members.get(2).setAge(39);
		members.get(2).setName("김철수");
		
		System.out.println(members.get(2).getName());
		System.out.println(members.get(2).getAge());
	}
}
