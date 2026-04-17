package exam0417;



import java.util.ArrayList;

public class MemberMain {
	public static void main(String[] args) {
		ArrayList<Member> list = new ArrayList<>();
		
		list.add(new Member("1번째","홍길동",20));
		list.add(new Member("2번째","김길동",35));
		list.add(new Member("3번째","박길동",15));
	
	
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
