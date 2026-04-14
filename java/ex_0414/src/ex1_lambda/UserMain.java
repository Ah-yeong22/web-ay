package ex1_lambda;

import java.util.Arrays;
import java.util.List;

public class UserMain {
	public static void main(String[] args) {
		
		List<User> list = Arrays.asList(
				new User("김철수", 25, "서울"),
	            new User("이영희", 18, "부산"),
	            new User("김민수", 30, "서울"),
	            new User("박지훈", 22, "대구")
	            );
		
		UserService us = new UserService();
		System.out.println("성인");
		us.filterUsers(list, us.getFilter("adult"));
		
		System.out.println("서울");
		us.filterUsers(list, us.getFilter("seoul"));
		
		System.out.println("김씨");
		us.filterUsers(list, us.getFilter("kim"));
	}
}
