#include <iostream>
int main(int argc, char **argv)
{
	int num = 0;
	scanf("%d", &num);
	for (int i = 0; i < num; i++)
	{
		int x1, y1, r1, x2, y2, r2;
		scanf("%d %d %d %d %d %d", &x1, &y1, &r1, &x2, &y2, &r2);
		int d = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
		int r = (r1 + r2) * (r1 + r2);
		int r_ = (r1 - r2) * (r1 - r2);
		if (d == 0)
		{
			if (r1 == r2)
			{
				printf("-1\n");
				continue;
			}
			else
			{
				printf("0\n");
				continue;
			}
		}
		else
		{
			if (d < r_ ){
				printf("0\n");
				continue;
			}
			else if ( d == r_ )
			{
				printf("1\n");
				continue;
			}
			else if ( r_ < d && d < r )
			{
					printf("2\n");
					continue;
			}
			else if (d == r)
			{
				printf("1\n");
				continue;
			}
			else
			{
				printf("0\n");
				continue;
			}
		}
	}
	return 0;
}