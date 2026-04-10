package exam;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class Bingo {
	public static void main(String[] args) {
		//1~50사이의 난수가 잇음
		//5*5  빙고판에 25개의 숫자를 채움
		//겹치면 안됨
		//만약에 말야 숫자가 정렬되게 들어간다면 섞어주기
		
		Set<Integer> set = new HashSet<>();
		
		while(set.size() < 25) {
			int ran = (int)(Math.random()*50) +1;
			set.add(ran);
		}
		List<Integer> list = new ArrayList<>(set);
		
		Collections.shuffle(list);
		
		int[][] bingo = new int[5][5];
		int index = 0;
		
		for(int i =0; i<5; i++) {
			for(int j =0; j<5; j++) {
				bingo[i][j] = list.get(index++);
			}
		}
		for(int i = 0; i <5; i++) {
			for(int j = 0; j <5; j++) {
				System.out.printf("%4d",bingo[i][j]);
			}
			System.out.println();
		}
		
		
	}
}
