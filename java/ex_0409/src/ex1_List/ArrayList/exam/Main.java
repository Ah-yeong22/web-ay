package ex1_List.ArrayList.exam;

import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class Main {
	public static void main(String[] args) {
		List<UserInfo> list = new ArrayList<>();
		
		for(int i = 0;i<3; i++) {
			Scanner sc = new Scanner(System.in);
			System.out.println("id 입력 : ");
			int id = sc.nextInt();
			System.out.println("pw 입력 : ");
			int pw = sc.nextInt();
			
			list.add(new UserInfo(id,pw));
			System.out.println();
			
			for(UserInfo u : list) {
				System.out.println(u.id);
				System.out.println(u.pw);
				System.out.println("----------------");
			}
		}
		
	}
}
