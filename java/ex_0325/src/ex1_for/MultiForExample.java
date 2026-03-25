package ex1_for;

public class MultiForExample {
	public static void main(String[] args) {
		
		for(int i = 1; i <=3; i++) {
			for(int j = 1; j <3; j++) {
				System.out.println(i + " "+ j);
			}
		}
		
		for(int i = 1; i <=6; i++) {
			for(int j = 1; j <=6; j++) {
				if (i+j == 6) {
				System.out.println(i + " " + j);
				}
			}
		}
		
		for(int i = 1; i <=3; i++) {//행의 갯수만큼
			for(int j=1; j <= 4; j++) {//열의 갯수만큼
				System.out.print(j +"");
			}
			System.out.println();
		}
		                        
		int count = 1;
		for(int i = 1; i <=3; i++) {
			for(int j = 1; j <=4; j++) {
				System.out.print(count++ +" ");
			}
			System.out.println();
		}
		char fuck = 'A';
		for(int i = 1; i <=3; i++) {
			for(int j=1; j <=4; j++) {
				System.out.print(fuck++ + " ");
			}System.out.println();
		
		}
		
	}
}
