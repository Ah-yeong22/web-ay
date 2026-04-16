package exam_0417.ex1;

import java.util.ArrayList;

public class Main {
	public static void main(String[] args) {
		ArrayList<Member> list = new ArrayList<>();
		
		list.add(new Member("hong","홍길동",20));
		list.add(new Member("kim","김길동",29));
		list.add(new Member("lee","이길동",25));
		
		for(Member m : list) {
			m.printInfo();
		}
		
		int count = 0;
		for(Member m : list) {
			if(m.getAge() >= 20) {
				count++;
			}
		}
		System.out.println("20세 이상 회원 수: " + count);
	}
}
